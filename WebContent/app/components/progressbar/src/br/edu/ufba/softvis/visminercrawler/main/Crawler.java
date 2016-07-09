package br.edu.ufba.softvis.visminercrawler.main;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.repositoryminer.RepositoryMiner;
import org.repositoryminer.codesmell.GodClass;
import org.repositoryminer.codesmell.ICodeSmell;
import org.repositoryminer.codesmell.LongMethod;
import org.repositoryminer.metric.ATFDMetric;
import org.repositoryminer.metric.CCMetric;
import org.repositoryminer.metric.IMetric;
import org.repositoryminer.metric.NOAMetric;
import org.repositoryminer.metric.SLOCMetric;
import org.repositoryminer.metric.TCCMetric;
import org.repositoryminer.metric.WMCMetric;
import org.repositoryminer.model.SCMType;
import org.repositoryminer.parser.java.JavaParser;
import org.repositoryminer.persistence.Connection;
import org.repositoryminer.scm.SCMRepository;

public class Crawler {

	public static void main(String[] args) throws IOException {
		// configura conexao
		Connection conn = Connection.getInstance();
		conn.connect("mongodb://localhost:27017", "visminer");
		// setup visminer
		RepositoryMiner miner = new RepositoryMiner();
		// setup targeted metrics
		List<IMetric> metrics = new ArrayList<IMetric>();
		List<ICodeSmell> codeSmells  = new ArrayList<ICodeSmell>();
		metrics.add(new SLOCMetric());
		metrics.add(new CCMetric());
		metrics.add(new ATFDMetric());
		metrics.add(new WMCMetric());
		metrics.add(new TCCMetric());
		metrics.add(new NOAMetric());
		codeSmells.add(new GodClass(30, 50, 0.2f, 20, true));
		codeSmells.add(new LongMethod(10, 10, 10, 10));
		// setup repository
		SCMRepository repository = new SCMRepository();
		repository.setScm(SCMType.GIT);
		repository.setDescription("junit");
		repository.setName("junit");
		repository.setPath("/home/isaac/git/junit5/.git");
		repository.setMetrics(metrics);
		repository.setCodeSmells(codeSmells);
		repository.setParsers(new JavaParser());
		// setup lang
		//List<LanguageType> langs = new ArrayList<LanguageType>();
		//langs.add(LanguageType.JAVA);		
		// mine it!
		miner.setRepositories(repository);
		miner.mine();
	}
}
